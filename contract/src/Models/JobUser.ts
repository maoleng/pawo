import User from './User';
import Job from './Job';
import { now } from '../helper';

class JobUser {

    constructor(
        public job: Job = new Job,
        public user: User = new User,
        public message: string = '',
        public createdAt: Date = now()
    ) {

    }

}

export default JobUser;