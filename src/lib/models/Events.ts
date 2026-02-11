import { Node } from "./Node";

export class Event extends Node {
  constructor (
    id: string,
    title: string,
    description: string,
    createdAd: Date,
    updatedAt: Date,
  ) {
    super(id, title, description, createdAd, updatedAt);
  }
}