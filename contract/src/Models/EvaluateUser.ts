import User from './User';
import { now } from '../helper';
import Job from "./Job";

class EvaluateUser {

    constructor(
        public evaluatorUser: User = new User,
        public evaluatedUser: User = new User,
        public job: Job = new Job,
        public star: number = 0,
        public message: string = '',
        public createdAt: Date = now()
    ) {

    }

}

export default EvaluateUser;