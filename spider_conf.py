#!/usr/bin/env python
#coding:utf-8

#抓取信息的网站
HOST="http://m.byr.cn"

#抓取信息的版块地址
HREF="/board/ParttimeJob"

#赚取信息的版块标签
CATEGORY="ParttimeJob"

#是否是第一次启动
FIRST=True

#第一次启动抓取遍历的索引页面数量
FIRST_PAGES=20

#更新时抓取的索引页面数量
UPDATE_PAGES=5

#页面抓取的间隔等待时间，单位为秒
PAGE_WAIT_TIME=1

#抓取系统更新的等待时间，单位为秒
UPDATE_WAIT_TIME=900

#redis数据库的地址
REDIS_HOST="localhost"

REDIS_PORT = 6379

REDIS_DB = 0
