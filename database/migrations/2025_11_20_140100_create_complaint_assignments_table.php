<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateComplaintAssignmentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('complaint_assignments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('complaint_id');
            $table->unsignedBigInteger('assigner_user_id')->nullable();
            $table->unsignedBigInteger('assignee_user_id')->nullable();
            $table->unsignedBigInteger('assignee_division_id')->nullable();
            $table->unsignedBigInteger('last_status_id')->nullable();
            $table->dateTime('due_at')->nullable();
            $table->text('remark')->nullable();
            $table->timestamps();

            // Foreign keys
            $table->foreign('complaint_id')->references('id')->on('complaints')->onDelete('cascade');
            $table->foreign('assigner_user_id')->references('id')->on('persons')->onDelete('set null');
            $table->foreign('assignee_user_id')->references('id')->on('persons')->onDelete('set null');
            $table->foreign('assignee_division_id')->references('id')->on('divisions')->onDelete('set null');
            $table->foreign('last_status_id')->references('id')->on('complaint_statuses')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('complaint_assignments');
    }
}