#!/usr/bin/env python
#coding=utf-8

import os.path
import time

import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web
import redis

from tornado.options import define, options
from spider_conf import *
from server_conf import * 
from ui_modules import *

define("port", default=8888, help="run on the given port", type=int)

class Application(tornado.web.Application):
    def __init__(self):
        handlers=[(r"/", MainHandler),
        (r"/article/ParttimeJob/(\d+)", ParttimeJobHandler),
        (r"/article/JobInfo/(\d+)", JobInfoHandler),
        (r"/index", IndexHandler),
        (r"/search", SearchHandler),]
        self.rs = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB)
        tornado.web.Application.__init__(self, handlers,
            template_path=os.path.join(os.path.dirname(__file__), "templates"),
            static_path=os.path.join(os.path.dirname(__file__), "static"),
            ui_modules=ui_module_components,
            debug=True)
class MainHandler(tornado.web.RequestHandler):
    """ the index.html
    """
    def get(self):
        rs = self.application.rs
        jobinfo_id_list = rs.zrevrange("index:time:sset:JobInfo", 1, -1)
        parttimejob_id_list = rs.zrevrange("index:time:sset:ParttimeJob", 1, -1)
        jobinfo_list = []
        parttimejob_list = []
        for id in jobinfo_id_list:
            jobinfo = rs.hgetall("article:JobInfo:"+id)
            jobinfo_list.append(jobinfo)
            if len(jobinfo_list) == INDEX_NUMBER:
                break
        for id in parttimejob_id_list:
            partimejob = rs.hgetall("article:ParttimeJob:"+id)
            parttimejob_list.append(partimejob)
            if len(parttimejob_list) == INDEX_NUMBER:
                break
        self.render("index.html", jobinfo_list = jobinfo_list, parttimejob_list=parttimejob_list)
          
class ParttimeJobHandler(tornado.web.RequestHandler):
    """ /article/ParttimeJob/$id
    """
    def get(self, id):
        rs = self.application.rs
        detailsInfo = rs.hgetall("article:ParttimeJob:"+id)
        if detailsInfo is None:
            self.write(u"您请求的页面不存在")
        else:
            self.render("post.html", job = detailsInfo)

class JobInfoHandler(tornado.web.RequestHandler):
    """ /article/JobInfo/$id
    """
    def get(self, id):
        rs = self.application.rs
        detailsInfo = rs.hgetall("article:JobInfo:"+id)
        if detailsInfo is None:
            self.write(u"您请求的页面不存在")
        else:
            self.render("post.html", job = detailsInfo)
class SearchHandler(tornado.web.RequestHandler):
    """/search
    """
    def get(self):
        word = self.get_argument("word", None)
        response = {}
        if word is None :
            response["status"] = "error"
            self.write(response)
        else:
            rs = self.application.rs
            print type(word)
            details_list = []
            jobinfo_id_list = rs.zrevrange("index:time:sset:JobInfo", 1, -1)
            parttimejob_id_list = rs.zrevrange("index:time:sset:ParttimeJob", 1, -1)
            for id in jobinfo_id_list:
                cur_info = rs.hgetall("article:JobInfo:"+id)
                if word in cur_info["title"].decode("utf-8"):
                    details_list.append(cur_info)
            for id in parttimejob_id_list:
                cur_info = rs.hgetall("article:ParttimeJob:"+id)
                if word in cur_info["title"].decode("utf-8"):
                    details_list.append(cur_info)
            response["status"] = "ok"
            
            res_list = sorted(details_list, key=lambda x:time.mktime(time.strptime(x["time"],"%Y-%m-%d %H:%M:%S")), reverse=True)
            
            response["list"] = res_list
            self.write(response)
                
class IndexHandler(tornado.web.RequestHandler):
    """ ajax index 
    """
    def get(self):
        rs = self.application.rs
        category = self.get_argument("category", None)
        page = self.get_argument("page", None)

        if category is None or page is None:
            self.write({"status":"error"})
        else:
#            print "category", category
#            print "page", page
            page = int(page)
            id_list = rs.zrevrange("index:time:sset:"+category, 1, -1)
            if len(id_list) <= (page-1)*INDEX_NUMBER or page < 1:
                self.write({"status":"error"})
            else:
                details_list = []
                for i in xrange((page-1)*INDEX_NUMBER, len(id_list)):
#                    print i
                    details = rs.hgetall("article:"+category+":"+id_list[i])
                    details_list.append(details)
                    if len(details_list) == INDEX_NUMBER:
                        break
                response = {}
                response["list"] = details_list
                response["status"] = "ok"
                self.write(response)

def main():
    tornado.options.parse_command_line()
    http_server = tornado.httpserver.HTTPServer(Application())
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()

if __name__ == "__main__":
    main()
