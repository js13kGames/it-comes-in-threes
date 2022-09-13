import express from "express"
import { UserService } from "login/server/users/service"
import { LoginRedirects, userExpress } from "login/server/utils"
import { resolve } from "path"
import { Pool } from "pg"
import { migrate } from "rocket/server/db/pg"
import { NotFound } from "rocket/server/errors"
import { renderPage } from "rocket/server/render"

import { AppServer } from "./app"
import { Base } from "./base.gen"
import { HTML } from "./html"


const
  pool = new Pool(),

  PORT = process.env.PORT || 3333,
  STATIC_DIR = resolve(__dirname, "..", "..", "static"),
  TITLE = "It Comes in Threes",

  users = UserService(pool),

  app = userExpress(TITLE, users)

.use("/redirects", LoginRedirects())

.get("*", (req, res, next) => {
  res.setHeader("Vary", "Content-Type")
  if (req.headers.accept && req.headers.accept.includes("text/html")) {
    users.current(req, res)
      .then(user => {
        const app = AppServer(req, user)
        res.send(renderPage(HTML(app, Base(app,
          app.router.match([
          ], () =>
            undefined
          )
        ))))
      }, next)
  } else {
    next()
  }
})

// APIs GO HERE

.use(express.static(STATIC_DIR))

.use((req, _, next) => {
  next(NotFound(`Cannot ${req.method} ${req.originalUrl}`))
})

.use(((error, req, res, _) => {
  const { message, status } = error
  if (status == null || status >= 500) {
    console.error("Internal Server Error:", error)
  }
  if (!res.headersSent) {
    res.status(status != null ? status : 500).send({ message })
  } else {
    console.error("Headers sent. Not sending anything. URL:", req.originalUrl)
  }
}) as express.ErrorRequestHandler)


migrate(pool, "threes", resolve(__dirname, "..", "..", "schema"), [
  //{ name: <some string>, cb: <some callback> },
])
  .then(() => {
    app.listen(PORT, () => {
      console.log(`${TITLE} Listening on Port ${PORT}...`)
    })
  }, error => {
    console.error("Error Running Migrations:", error)
  })
