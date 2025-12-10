<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('complaint_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('complaint_id');
            $table->unsignedBigInteger('complaint_assignment_id')->nullable();
            $table->unsignedBigInteger('status_id')->nullable();
            $table->timestamp('created_at')->nullable();
            $table->string('action')->nullable();
            $table->timestamp('updated_at')->nullable();
            $table->unsignedBigInteger('assignee_id')->nullable();
            $table->text('remark')->nullable();

            $table->foreign('complaint_id')->references('id')->on('complaints')->onDelete('cascade');
            $table->foreign('complaint_assignment_id')->references('id')->on('complaint_assignments')->onDelete('set null');
            $table->foreign('status_id')->references('id')->on('status')->onDelete('set null');
            $table->foreign('assignee_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('complaint_logs');
    }
};
