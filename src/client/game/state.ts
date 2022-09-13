import { Prop } from "rocket/prop/prop"

import { Round } from "./round"


export type State = TitleState | PrePlayState | PlayState | EndState

export type TitleState = { t: "title" }

export type PrePlayState = { t: "prePlay", round: Round }

export type PlayState = { t: "play", paused: Prop<boolean>, round: Round }

export type EndState = { t: "end", round: Round }
