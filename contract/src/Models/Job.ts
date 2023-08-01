import User from './User';
import { now } from '../helper';

class Job {

    constructor(
        public id: number = 0,
        public title: string = '',
        public description: string = '',
        public categories: string[] = [],
        public money: number = 0,
        public creator: User = new User,
        public status: number = 0,
        public freelancer: User = new User,
        public startedAt: Date = now(),
        public finishedAts: Date[] = [],
        public deadline: Date = now(),
        public createdAt: Date = now()
    ) {

    }

}

export default Job;