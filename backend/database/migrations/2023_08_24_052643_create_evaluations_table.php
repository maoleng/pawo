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
        Schema::create('evaluations', function (Blueprint $table) {
            $table->foreignId('evaluatorId')->nullable()->constrained('users');
            $table->foreignId('evaluatedId')->nullable()->constrained('users');
            $table->foreignId('jobId')->constrained('jobs');
            $table->double('star');
            $table->string('message');
            $table->dateTime('createdAt');
            $table->primary(['evaluatedId', 'evaluatorId', 'jobId']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluations');
    }
};
