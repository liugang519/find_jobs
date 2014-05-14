#!/usr/bin/env python
#coding=utf-8

import time
import re
import hashlib

import bs4
import requests
from bs4 import BeautifulSoup
import redis

from spider_conf import *

def m_byr_page_parser(url):
    """ get infomation from article page
    """
    r = requests.get(url)
    soup = BeautifulSoup(r.text)
    soup_info = soup.find("ul", "list sec")
    
    title = soup_info.find("li", "f")
    soup_info_head = soup_info.find("div", "nav hl")
    author = soup_info_head.find("a", href=re.compile("/user/query/")).string
    t = soup_info_head.find_all("a", "plant")[1].string
    soup_info_body = soup_info.find("div", "sp")
    content = []
    for s in soup_info_body.strings:
        content.append(s)
    items = url.split("/")
    info_dict = {}
    info_dict["id"] = items[-1]
    info_dict["category"] = items[-2]
    info_dict["title"] = title.string
    info_dict["author"] = author.string
    info_dict["time"] = t.string
    info_dict["content"] = "\n".join(content[:-2])
    return info_dict

def m_byr_index_parser(url):
    """get article url from index page
    """
    r = requests.get(url)
    soup = BeautifulSoup(r.text)
    soup_index_list = soup.find("ul", "list sec")
    soup_a_list = soup_index_list.find_all("a", href=re.compile("article"))
    url_list = []
    for a in soup_a_list:
        url_list.append(a["href"])
    return url_list

def crawler(host=HOST,href=HREF,first=FIRST):
    if first:
        pages = FIRST_PAGES
    else:
        pages = UPDATE_PAGES
    rs = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB)
    # init current keywords
    
    for wd in KEY_WORDS:
        rs.sadd("keyword:set", wd)

    while(True):
        for page in xrange(pages):
            index_url = host+href+"?p="+str(page)
            print "Parsing Index:",index_url
            try:
                url_list = m_byr_index_parser(index_url)
            except Exception, e:
                print "PARSE INDEX ERROR"
                print "URL:", index_url
                print "TIME:", time.ctime()
                print e
                continue
            for url in url_list:
                try:
                    info_dict = m_byr_page_parser(host+url)
                    print "Parsing Page:", host+url,
                except Exception, e:
                    print "PARSE PAGE ERROR"
                    print "URL:", host+url
                    print "TIME:", time.ctime()
                    print e
                    continue
                try:
                    if rs.sismember("article:"+info_dict["category"]+":id:set", info_dict["id"]):
                        ori_info_dict = rs.hgetall("article:"+info_dict["category"]+":"+info_dict["id"])
                        if hashlib.md5(ori_info_dict["title"].decode("utf-8").encode("utf-8")).hexdigest() != hashlib.md5(info_dict["title"].encode("utf-8")).hexdigest():
                            rs.hset("article:"+info_dict["category"]+":"+info_dict["id"], "title", info_dict["title"])
                            print "UPDATE"
                        elif hashlib.md5(ori_info_dict["content"].decode("utf-8").encode("utf-8")).hexdigest() != hashlib.md5(info_dict["content"].encode("utf-8")).hexdigest():
                            rs.hset("article:"+info_dict["category"]+":"+info_dict["id"], "content", info_dict["content"])
                            print "UPDATE"
                        else:
                            print "HAVED"
                    else:
                        #article:$category:id
                        rs.hmset("article:"+info_dict["category"]+":"+info_dict["id"], info_dict)
                        #article:$category:id:set
                        rs.sadd("article:"+info_dict["category"]+":id:set", info_dict["id"])
                        #index:time:sset:$category
                        article_time = time.mktime(time.strptime(info_dict["time"],"%Y-%m-%d %H:%M:%S"))
                        rs.zadd("index:time:sset:"+info_dict["category"], info_dict["id"], article_time)
                        #reverse:index:$keyword:id:set
                        keywords = rs.smembers("keyword:set")
                        for wd in keywords:
                            wd = wd.decode("utf-8")
                            if wd in info_dict["title"]:
                                rs.sadd("reverse:index:"+wd+":id:set", info_dict["id"])
                        print "ADD"
                except Exception, e:
                    print "REDIS ERROR"
                    print "TIME:", time.ctime()
                    print e
                    rs = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB)
                    continue
                time.sleep(PAGE_WAIT_TIME)
        if pages == FIRST_PAGES:
            pages = UPDATE_PAGES
        print "Sleep..."
        time.sleep(UPDATE_WAIT_TIME)

def test():
#    url = "http://m.byr.cn/article/ParttimeJob/355772"
#    info_dict = m_byr_page_parser(url)
    rs = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB)
    i_d = rs.hgetall("article:ParttimeJob:355772")
    for k in i_d:
        print k,i_d[k],type(i_d[k])
#    rs.hmset("article:"+info_dict["category"]+":"+info_dict["id"], info_dict)
#    url = "http://m.byr.cn/board/ParttimeJob?p=4"
#    print m_byr_index_parser(url)
#    crawler()

def main():
    crawler()

if __name__ == "__main__":
    main()
