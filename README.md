read-art [![NPM version](https://badge.fury.io/js/read-art.svg)](http://badge.fury.io/js/read-art) [![Build Status](https://travis-ci.org/Tjatse/node-readability.svg?branch=master)](https://travis-ci.org/Tjatse/node-readability) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
=========
[![NPM](https://nodei.co/npm/read-art.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/read-art/)

1. Readability reference to Arc90's.
2. Scrape article from any page (automatically).
3. Make any web page readable, no matter Chinese or English.

> *快速抓取网页文章标题和内容，适合node.js爬虫使用，服务于ElasticSearch。*

## Guide

- [Features](https://github.com/Tjatse/node-readability/wiki/Handbook#features)
- [Performance](https://github.com/Tjatse/node-readability/wiki/Handbook#perfs)
- [Installation](https://github.com/Tjatse/node-readability/wiki/Handbook#ins)
- [Usage](https://github.com/Tjatse/node-readability/wiki/Handbook#usage)
- [Debug](https://github.com/Tjatse/node-readability/wiki/Handbook#debug)
- [Score Rule](https://github.com/Tjatse/node-readability/wiki/Handbook#score_rule)
- [Extract Selectors](https://github.com/Tjatse/node-readability/wiki/Handbook#selectors)
- [Image Fallback](https://github.com/Tjatse/node-readability/wiki/Handbook#imgfallback)
- [Threshold](https://github.com/Tjatse/node-readability/wiki/Handbook#threshold)
- [Customize Settings](https://github.com/Tjatse/node-readability/wiki/Handbook#cus_sets)
- [Output](https://github.com/Tjatse/node-readability/wiki/Handbook#output)
- [Notes](https://github.com/Tjatse/node-readability/wiki/Handbook#notes)

## How it works

In my case, the speed of [spider](https://github.com/Tjatse/spider2) is about **1500k documents per day**, and the maximize crawling speed is **1.2k /minute**, **avg 1k /minute**, the memory cost are about **200 MB** on each spider kernel, and the accuracy is about 90%, the rest 10% can be fixed by customizing [Score Rules](https://github.com/Tjatse/node-readability/wiki/Handbook#score_rule) or [Selectors](https://github.com/Tjatse/node-readability/wiki/Handbook#selectors). it's better than any other readability modules.
> (4) Server infos:
> * 20M bandwidth of fibre-optical
> * 8 Intel(R) Xeon(R) CPU E5-2650 v2 @ 2.60GHz cpus
> * 32G memory
