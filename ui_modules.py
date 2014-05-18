import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web

class HeaderModule(tornado.web.UIModule):
    def render(self):
        return self.render_string("header.html")

class FooterModule(tornado.web.UIModule):
    def render(self):
        return self.render_string("footer.html")

ui_module_components = {"Header": HeaderModule,
                        "Footer": FooterModule}