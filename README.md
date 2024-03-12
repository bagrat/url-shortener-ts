# URL Shortener

This is a demo web application implementing a URL shortener using TypeScript, Express and React with an in-memory database persisted on-disk.

## Launch the app locally

The app repo is shipped with a Docker Compose file alowing one step launch of the app on your local machine. Run the commands below to get the app up and running:

```shell
git clone git@github.com:bagrat/url-shortener-ts.git
cd url-shortener-ts
docker-compose up
```

Let Docker do its heavy-lifting for a couple of minutes and as soon as you see the below log line, go ahead and navigate your browser to `http://localhost:8000` and start playing around with your own local URL shortener.

```log
Server is running on http://localhost:8000
```

Have fun and feel free to file issues to this repo or submit Pull Requests!
