import { Request } from "express"
import { User } from "login/models/user"
import { Asink, AsinkLoaded } from "rocket/prop/async"
import { Router } from "rocket/route/router"
import { ServerRouter } from "rocket/server/router"

import { App } from "../app"


export type AppServer = App & {
  cspNonce: string
  router: Router
  user: Asink<User>
}


export const
  AppServer = (req: Request, user: User): AppServer => {
    const [path, search] = req.url.split("?", 2)
    return {
      cspNonce: (req as any).cspNonce,
      router: ServerRouter(path, search ?? ""),
      user: AsinkLoaded(user),
    }
  }
