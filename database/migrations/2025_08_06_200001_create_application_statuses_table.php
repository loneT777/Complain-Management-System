<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateApplicationStatusesTable extends Migration
{
    public function up(): void
    {
        Schema::create('application_statuses', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('status_id');
            $table->unsignedBigInteger('application_id');
            $table->unsignedBigInteger('session_id');
            // $table->unsignedBigInteger('user_id');

            $table->foreign('status_id')->references('id')->on('statuses')->onDelete('restrict')->onUpdate('cascade');
            $table->foreign('application_id')->references('id')->on('applications')->onDelete('restrict')->onUpdate('cascade');
            $table->foreign('session_id')->references('id')->on('login_sessions')->onDelete('restrict')->onUpdate('cascade');
            // $table->foreign('user_id')->references('id')->on('users')->onDelete('restrict')->onUpdate('cascade');

            $table->text('remark')->nullable();
            $table->dateTime('created_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('application_statuses');
    }
}
