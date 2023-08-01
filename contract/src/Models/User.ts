import { now } from '../helper';

class User {

    constructor(
        public id: number = 0,
        public name: string = '',
        public rate: number = 0,
        public accountId: string = '',
        public createdAt: Date = now()
    ) {

    }

}

export default User;