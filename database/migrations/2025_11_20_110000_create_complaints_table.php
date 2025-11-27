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
        Schema::create('complaints', function (Blueprint $table) {
            $table->id();
            $table->string('reference_no')->unique();
            $table->string('title');
            $table->text('description');
            $table->unsignedBigInteger('complainant_id');
            $table->unsignedBigInteger('last_status_id')->nullable();
            $table->unsignedBigInteger('complaint_requested_id')->nullable();
            $table->timestamp('received_at')->nullable();
            $table->unsignedBigInteger('user_received_id')->nullable();
            $table->string('channel')->nullable();
            $table->string('priority_level')->nullable();
            $table->string('confidentiality_level')->nullable();
            $table->date('due_at')->nullable();
            $table->string('complainant_name')->nullable();
            $table->string('complainant_phone')->nullable();
            $table->text('remark')->nullable();
            $table->timestamps();

            $table->foreign('complainant_id')->references('id')->on('persons')->onDelete('cascade');
            $table->foreign('last_status_id')->references('id')->on('status')->onDelete('set null');
            $table->foreign('complaint_requested_id')->references('id')->on('persons')->onDelete('set null');
            $table->foreign('user_received_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('complaints');
    }
};
