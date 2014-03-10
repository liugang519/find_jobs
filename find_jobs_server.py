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

define("port", default=8888, help="run on the given port", type=int)

class MainHandler(tornado.web.RequestHandler):
    def get(self):
#        self.write("Hello, word")
        rs = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB)
        id_list = rs.smembers("article:ParttimeJob:id:set")
        index_list = []
        c = 0
        for id in id_list:
            index_list.append(rs.hget("article:ParttimeJob:"+id, "title"))
            c += 1
            if c == 15:
                break
        self.render("index.html", index_list=index_list)       
def main():
    tornado.options.parse_command_line()
    application = tornado.web.Application(
            handlers=[(r"/", MainHandler),],
            template_path=os.path.join(os.path.dirname(__file__), "templates"),
            static_path=os.path.join(os.path.dirname(__file__), "static"),
            )

    http_server = tornado.httpserver.HTTPServer(application)
    http_server.listen(options.port, address="10.103.241.2")
    tornado.ioloop.IOLoop.instance().start()

if __name__ == "__main__":
    main()
