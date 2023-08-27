<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Job;
use App\Models\User;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $faker = Faker::create();

        for ($i = 1; $i <= 10; $i++) {
            User::query()->create([
                'name' => $faker->name,
                'rate' => 0,
                'accountId' => Str::random(),
                'createdAt' => $faker->dateTime,
            ]);
        }

        for ($i = 1; $i <= 30; $i++) {
            Job::query()->create([
                'title' => $faker->title,
                'description' => $faker->text,
                'categories' => $faker->randomElements(['IT', 'Blockchain', 'Backend', 'Frontend']),
                'money' => random_int(10, 90),
                'creatorId' => random_int(1, 10),
                'status' => 0,
                'createdAt' => $faker->dateTime,
            ]);

        }


    }
}
