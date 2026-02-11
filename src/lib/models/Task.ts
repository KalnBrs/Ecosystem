import { Node } from "./Node";

export class Task extends Node {
  constructor (
    id: string,
    title: string,
    description: string,
    createdAd: Date,
    updatedAt: Date,
    public isDone: boolean,
  ) {
    super(id, title, description, createdAd, updatedAt);
  }
}