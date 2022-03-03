export class Property {
  constructor(
    public _id: string,
    public iPropertyId: string,
    public sPropertyName: string,
    public oProperty: object,
    public sCode?: string
  ) {
  }
}
