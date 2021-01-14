export class Place{
    constructor(
        public id: string,
        public title: string,
        public desription: string,
        public imageUrl: string,
        public price: number,
        public availableFrom: Date,
        public availableTo: Date,
        public userId: string
    ){}}