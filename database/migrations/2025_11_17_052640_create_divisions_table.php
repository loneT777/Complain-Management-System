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
        Schema::create('divisions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->string('location')->nullable();
            $table->boolean('is_approved')->default(false);
            $table->text('remark')->nullable();
            $table->unsignedBigInteger('session_id')->nullable();
            $table->string('code')->nullable();
            $table->string('officer_in_charge')->nullable();
            $table->string('contact_no')->nullable();
            $table->timestamps();

            $table->foreign('parent_id')->references('id')->on('divisions')->onDelete('set null');
            $table->foreign('session_id')->references('id')->on('sessions')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('divisions');
    }
};
