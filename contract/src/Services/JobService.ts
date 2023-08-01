import JobStatus from "../Enums/JobStatus";

export function allStatusFailExcept(status, exceptStatus)
{
    if (Array.isArray(exceptStatus)) {
        if (exceptStatus.includes(status)) {
            return true;
        }

        return 'This job is not finish';
    }

    if (status === exceptStatus) {
        return true;
    }

    switch (status) {
        case JobStatus.WAITING:
            return 'This job is still waiting';
        case JobStatus.PROCESSING:
            return 'This job is still processing';
        case JobStatus.PENDING:
            return 'This job is pending for the recruiter send money';
        case JobStatus.STOPPED:
            return 'This job is stopped already';
        case JobStatus.PAID:
            return 'This job is paid already';
        case JobStatus.OVERDUE:
            return 'This job is overdue already';
    }
}