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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('role_id');
            $table->string('username')->unique();
            $table->string('password');
            $table->string('full_name');
            $table->unsignedBigInteger('person_id');
            $table->unsignedBigInteger('division_id');
            $table->boolean('is_approved');
            $table->unsignedBigInteger('session_id')->nullable();
            $table->unsignedBigInteger('updated_session_id');
            $table->timestamps();

            $table->foreign('role_id')->references('id')->on('roles');
            $table->foreign('person_id')->references('id')->on('persons');
            $table->foreign('division_id')->references('id')->on('divisions');
            $table->foreign('session_id')->references('id')->on('sessions');
            $table->foreign('updated_session_id')->references('id')->on('sessions');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('users');
    }
};
