export class Node{
  constructor (
    public id: string,
    public title: string,
    public description: string,
    public createdAt: Date,
    public updatedAt: Date
  ) {}
}