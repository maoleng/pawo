import {executeWithReset, now, responseData, responseMessage, updateObject} from './helper';
import {call, near, NearBindgen, NearPromise, view} from 'near-sdk-js';
import Job from "./Models/Job";
import User from "./Models/User";
import JobStatus from "./Enums/JobStatus";
import JobUser from "./Models/JobUser";
import {allStatusFailExcept} from "./Services/JobService";
import EvaluateUser from "./Models/EvaluateUser";
import {checkStarRating, includeReputationToJob} from "./Services/EvaluateService";


@NearBindgen({})
class Main
{
    jobs: Job[] = [];
    users: User[] = [];
    jobUsers: JobUser[] = [];
    evaluateUsers: EvaluateUser[] = [];

    @view({})
    @executeWithReset
    GetJob({ id, title, category, status, creatorId }): string
    {
        if (id != null) {
            const jobIndex = this.jobs.findIndex(e => e.id === id);
            if (jobIndex === -1) {
                return responseMessage(false, 'Not find job.');
            }

            return responseData(this.includeReputationToJob(this.jobs[jobIndex]));
        }

        return responseData(this.jobs.filter(e => {
            let matchTitle = true;
            let matchCategory = true;
            let matchStatus = true;
            let matchCreator = true;

            if (title != null) {
                matchTitle = e.title.includes(title);
            }
            if (category != null) {
                matchCategory = e.categories.includes(category);
            }
            if (status != null) {
                matchStatus = e.status === status;
            }
            if (creatorId != null) {
                matchCreator = e.creator.id === creatorId;
            }

            return matchTitle && matchCategory && matchStatus && matchCreator;
        }).map((job) => this.includeReputationToJob(job)));
    }

    includeReputationToJob(job: Job)
    {
        const evaluates = this.evaluateUsers.filter(e => e.job.id === job.id && e.evaluatorUser.id !== job.creator.id);
        const star = evaluates.reduce((acc, evaluateUser) => acc + evaluateUser.star, 0) / evaluates.length;

        return {
            ...job,
            star,
        };
    }

    @view({})
    @executeWithReset
    GetUser({ id, name, accountId })
    {
        if (id != null) {
            const jobIndex = this.users.findIndex(e => e.id === id);
            if (jobIndex === -1) {
                return responseMessage(false, 'Not find user.');
            }

            return responseData(this.users[jobIndex]);
        }
        if (accountId != null) {
            const jobIndex = this.users.findIndex(e => e.accountId === accountId);
            if (jobIndex === -1) {
                return responseMessage(false, 'Not find user.');
            }

            return responseData(this.users[jobIndex]);
        }

        return responseData(this.users.filter(e => {
            let matchName = true;

            if (name != null) {
                matchName = e.name.includes(name);
            }

            return matchName;
        }));
    }

    @call({})
    @executeWithReset
    CreateJob({ title, description, categories, money }): string
    {
        this.jobs.push({
            id: this.jobs.length + 1,
            title: title,
            description: description,
            categories: categories,
            money: money,
            status: JobStatus.WAITING,
            creator: this.authed(),
            createdAt: now(),
            startedAt: undefined,
            finishedAts: undefined,
            freelancer: undefined,
            deadline: undefined,
        });

        return responseMessage(true, 'Create Job successfully');
    }

    @call({})
    UpdateJob({ id, title, description, categories, money }): string
    {
        const jobIndex = this.findJobIndexOrFail(id, true);
        if (typeof jobIndex !== 'number') return jobIndex;

        updateObject(this.jobs[jobIndex], {title, description, categories, money});

        return responseMessage(true, 'Update Job successfully');
    }

    @call({})
    DeleteJob({ id }): string
    {
        const jobIndex = this.findJobIndexOrFail(id, true);
        if (typeof jobIndex !== 'number') return jobIndex;

        this.jobs.splice(jobIndex, 1);

        return responseMessage(true, 'Delete Job successfully');
    }

    @call({})
    @executeWithReset
    RegisterJob({ id, message }): string
    {
        const jobIndex = this.findJobIndexOrFail(id);
        if (typeof jobIndex !== 'number') return jobIndex;

        const user = this.authed();
        if (! this.jobUsers.find(e => e.job.id === id && e.user.id === user.id)) {
            this.jobUsers.push({
                job: this.jobs[jobIndex],
                user: user,
                message: message,
                createdAt: now(),
            });

            return responseMessage(true, 'Register successfully');
        }

        return responseMessage(false, 'You have registered this job before');
    }

    @view({})
    @executeWithReset
    GetJobRegister({ id }): string
    {
        return responseData(
            this.jobUsers
                .filter(e => e.job.id === id)
                .map(({ user, message, createdAt }) => ({ user, message, createdAt }))
        );
    }

    @view({})
    @executeWithReset
    GetJobRegisteredByUser({ id }): string
    {
        return responseData(
            this.jobUsers
                .filter(e => e.user.id === id)
                .map(({ job, message, createdAt }) => ({ job, message, createdAt }))
        );
    }

    @call({})
    ChooseFreelancer({ userId, jobId }): string
    {
        const jobIndex = this.findJobIndexOrFail(jobId, true);
        if (typeof jobIndex !== 'number') return jobIndex;

        const jobUser = this.jobUsers.find(e => e.user.id === userId && e.job.id === jobId);
        if (jobUser == null) {
            return responseMessage(false, 'This user not register this job');
        }
        let freelancer = this.jobs[jobIndex].freelancer;
        if (freelancer != null) return responseMessage(false, `You have chose ${freelancer.accountId} for doing this job.`);

        this.jobs[jobIndex].freelancer = jobUser.user;

        return responseMessage(true, 'Choose freelancer successfully');
    }

    @call({})
    SetJobDeadline({ jobId, deadline }): string
    {
        const jobIndex = this.findJobIndexOrFail(jobId, true);
        if (typeof jobIndex !== 'number') return jobIndex;

        const job = this.jobs[jobIndex];
        if (job.freelancer == null) {
            return responseMessage(false, 'There is no freelancer, please choose one then set deadline');
        }

        job.status = JobStatus.PROCESSING;
        job.startedAt = job.startedAt || now();
        job.deadline = new Date(deadline);

        return responseMessage(true, 'Set deadline successfully');
    }

    @call({})
    SendPaymentRequest({ id }): string
    {
        const jobIndex = this.findJobIndexOrFail(id, false, true);
        if (typeof jobIndex !== 'number') return jobIndex;

        const job = this.jobs[jobIndex];

        const checkJobStatus = allStatusFailExcept(job.status, JobStatus.PROCESSING);
        if (checkJobStatus !== true) return responseMessage(false, checkJobStatus);

        job.status = JobStatus.PENDING;
        job.finishedAts = job.finishedAts || [];
        job.finishedAts.push(now());

        return responseMessage(true, 'Send payment request successfully');
    }

    @call({ payableFunction: true })
    VerifyPaymentRequest({ id })
    {
        const jobIndex = this.findJobIndexOrFail(id, true);
        if (typeof jobIndex !== 'number') return jobIndex;

        const job = this.jobs[jobIndex];
        const checkJobStatus = allStatusFailExcept(job.status, JobStatus.PENDING);
        if (checkJobStatus !== true) return responseMessage(false, checkJobStatus);

        job.status = JobStatus.PAID;

        return NearPromise.new(job.freelancer.accountId).transfer(BigInt(job.money * 1000000000000000000000000))
    }

    @call({})
    Evaluate({ userId, jobId, star, message })
    {
        if (! checkStarRating(star)) return responseMessage(false, 'Invalid star rating, star should be 0~5, only 1 decimal.');
        const evaluator = this.authed();

        const jobIndex = this.findJobIndexOrFail(jobId);
        if (typeof jobIndex !== 'number') return jobIndex;

        const job = this.jobs[jobIndex];
        if ((job.freelancer.id !== userId && job.freelancer.id !== evaluator.id) || (job.creator.id !== userId && job.creator.id !== evaluator.id)) {
            return responseMessage(false, 'You do not do this job and you are not the creator of this job.');
        }
        const checkJobStatus = allStatusFailExcept(job.status, [JobStatus.PAID, JobStatus.STOPPED, JobStatus.OVERDUE]);
        if (checkJobStatus !== true) return responseMessage(false, checkJobStatus);

        const evaluate = this.evaluateUsers.find(e => e.job.id === jobId && e.evaluatorUser.id === evaluator.id && e.evaluatedUser.id === userId);
        if (evaluate != null) {
            return responseMessage(false, 'You have evaluated this already');
        }
        this.evaluateUsers.push({
            evaluatorUser: evaluator,
            evaluatedUser: this.users.find(e => e.id === userId),
            job: job,
            star: star,
            message: message,
            createdAt: now(),
        });

        return responseMessage(true, 'Evaluate successfully');
    }

    @call({})
    @executeWithReset
    Register(): string
    {
        this.authed();

        return responseMessage(true, 'Register successfully');
    }

    @call({})
    @executeWithReset
    authed(): User
    {
        const accountId = near.signerAccountId();
        let user = this.users.find(e => e.accountId === accountId);
        if (user == null) {
            const countUser = this.users.push({
                id: this.users.length + 1,
                name: undefined,
                rate: 0,
                accountId: accountId,
                createdAt: now(),
            });
            user = this.users[countUser - 1];
        }

        return user;
    }

    @call({})
    ResetData(): void
    {
        this.jobs = [];
        this.users = [];
        this.jobUsers = [];
        this.evaluateUsers = [];
    }

    @view({})
    GetData(): string
    {
        return responseData({
            jobs: this.jobs,
            users: this.users,
            jobUsers: this.jobUsers,
            evaluateUsers: this.evaluateUsers,
        });
    }

    resetProperty(): void
    {
        this.jobs = this.jobs == null ? [] : this.jobs;
        this.users = this.users == null ? [] : this.users;
        this.jobUsers = this.jobUsers == null ? [] : this.jobUsers;
        this.evaluateUsers = this.evaluateUsers == null ? [] : this.evaluateUsers;
    }

    findJobIndexOrFail(id: number, isCheckOwner = false, isCheckFreelancer = false)
    {
        const jobIndex = this.jobs.findIndex(e => e.id === id);
        if (jobIndex === -1) {
            return responseMessage(false, 'Not find job.');
        }
        if (isCheckOwner && this.jobs[jobIndex].creator.id !== this.authed().id) {
            return responseMessage(false, 'This job is not yours.');
        }
        if (isCheckFreelancer && (this.jobs[jobIndex]?.freelancer?.id !== this.authed().id)) {
            return responseMessage(false, 'You are not doing this job');
        }


        return jobIndex;
    }

    constructor()
    {
        this.jobs = this.jobs == null ? [] : this.jobs;
        this.users = this.users == null ? [] : this.users;
        this.jobUsers = this.jobUsers == null ? [] : this.jobUsers;
        this.evaluateUsers = this.evaluateUsers == null ? [] : this.evaluateUsers;
    }

}