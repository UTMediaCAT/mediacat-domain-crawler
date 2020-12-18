


Our goal is to monitor our servers during a crawl.

We are attempting to monitor our resources through using appmetrics or grafana and prometheus 

Here are some notes as to how to set it up:

1. First start the crawler or whatever process that you want to monitor in a screen

`screen -L -S crawler`
`root@instance-1:/voyage_storage/mediacat-domain-crawler/newCrawler# node crawl.js -f ../../mediacat-hidden/domain.csv `

2. Set up the monitor end point for looking at the database entries on another screen

`node app.js` in the `mediacat-domain-crawler/newCrawler/monitor/app` dir

3. On another screen, set up grafana (Port 3000)

username and password is admin, admin. Skip changing the password or if you do jot it down somewhere.

`root@instance-1:/voyage_storage/mediacat-domain-crawler/newCrawler/monitor/prometheus/grafana-7.3.5/bin# ./grafana-server `

4. On another screen, set up node_exporter (Port 81)

`root@instance-1:/voyage_storage/mediacat-domain-crawler/newCrawler/monitor/prometheus/node_exporter-1.0.1.linux-amd64# ./node_exporter --web.listen-address=:81`

5. On another screen, set up prometheus (Port 80)

`root@instance-1:/voyage_storage/mediacat-domain-crawler/newCrawler/monitor/prometheus/prometheus-2.23.0.linux-amd64# ./prometheus --config.file=prometheus.yml  --web.listen-address=:80`

Configure grafana to listen to prometheus and node_exporter 

- add data source:
    -- select prometheus,
    -- url: http://localhost:80
    -- save and test

create dashboards:
- click the plus sign, and import
- import dashboard id such as 1860 for node exporter, or id 405
- click load and select prometheus as localhost
- click import


Go to the localhost:80 or localhost:81 to see the prometheus or node_exporter dashboards there

Go to localhost:80/metrics or localhost:80/metrics to see the metrics there

May have to clear previous data info from the metrics databases (documentation: https://prometheus.io/,  https://github.com/prometheus/node_exporter , https://grafana.com/)

# Appmetrics

go to 
http://206.12.91.146:3001/appmetrics-dash/

root@instance-1:/voyage_storage/mediacat-domain-crawler/newCrawler/monitor/appmetrics# node app.js 
