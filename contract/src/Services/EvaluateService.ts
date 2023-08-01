import Job from "../Models/Job";

export function checkStarRating(rating)
{
    return /^([0-5](\.\d)?)$/.test(rating.toString());
}

export function includeReputationToJob(job: Job)
{
    const evaluates = this.evaluateUsers.filter(e => e.job.id === job.id && e.evaluatorUser.id !== job.creator.id);
    const star = evaluates.reduce((acc, evaluateUser) => acc + evaluateUser.star, 0) / evaluates.length;

    return {
        ...job,
        star,
    };
}