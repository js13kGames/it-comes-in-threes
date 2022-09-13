import { apd, ApdArg } from "rocket/browser/core"

import { App } from "../app"


export const
  Base = (_app: App, ...args: ApdArg[]) =>
    apd(
      ...args,
    )
