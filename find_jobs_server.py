#!/usr/bin/env python
#coding:utf-8

import os.path

import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web
import redis

from tornado.options import define, options
from spider_conf import *
from server_conf import * 

define("port", default=8888, help="run on the given port", type=int)

class MainHandler(tornado.web.RequestHandler):
    def get(self):
#        self.write("Hello, word")
        rs = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB)
        id_list = rs.zrevrange("index_time_sset", 1, -1)
        jobs_list = []
        p = self.get_argument("p", None)
        if p is None:
            p = 1
        else:
            p = int(p)
        start = (p-1)*INDEX_NUMBER+1
        if p < 1 or start > len(id_list):
            raise tornado.web.HTTPError(404)
        else:
            end = min(start+INDEX_NUMBER-1, len(id_list))
            for i in xrange(start-1,end):
                jobs_list.append(rs.hgetall("article:ParttimeJob:"+id_list[i]))
        url_pre = ""
        url_next = ""
        if p-1 >= 1:
            url_pre = "/?p="+str(p-1)
        if (p*INDEX_NUMBER+1) <= len(id_list):
            url_next = "/?p="+str(p+1)
        
        self.render("index.html", jobs_list=jobs_list, url_pre=url_pre, url_next=url_next)
          
class ParttimeJobHandler(tornado.web.RedirectHandler):
    """ /article/$category/$id
    """
    def get(self, id):
        rs = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB)
        job = rs.hgetall("article:ParttimeJob:"+id)
        if job is None:
            self.write(u"您请求的页面不存在")
        else:
            self.render("post_temple.html", job=job)
def main():
    tornado.options.parse_command_line()
    application = tornado.web.Application(
            handlers=[(r"/", MainHandler), (r"/article/Parttime/(\d+)", ParttimeJobHandler),],
            template_path=os.path.join(os.path.dirname(__file__), "templates"),
            static_path=os.path.join(os.path.dirname(__file__), "static"),
            )

    http_server = tornado.httpserver.HTTPServer(application)
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()

if __name__ == "__main__":
    main()
