<?php declare(strict_types=1);

namespace App\Enums;

use BenSampo\Enum\Enum;

final class JobStatus extends Enum
{
    public const WAITING = 0;
    public const PROCESSING = 1;
    public const PENDING = 2;
    public const STOPPED = 3;
    public const PAID = 4;
    public const OVERDUE = 5;
}
