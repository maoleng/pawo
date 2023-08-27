<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('jobs', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->json('categories');
            $table->double('money');
            $table->foreignId('creatorId')->constrained('users');
            $table->integer('status');
            $table->foreignId('freelancerId')->nullable()->constrained('users');
            $table->dateTime('startedAt')->nullable();
            $table->json('finishedAts')->nullable();
            $table->dateTime('deadline')->nullable();
            $table->dateTime('createdAt');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jobs');
    }
};
