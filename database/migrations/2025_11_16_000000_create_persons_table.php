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
        Schema::create('persons', function (Blueprint $table) {
            $table->id();
            $table->string('title', 20)->nullable();
            $table->string('first_name', 100)->nullable();
            $table->string('last_name', 100)->nullable();
            $table->string('full_name', 200);
            $table->string('nic', 12)->unique();
            $table->string('code', 50)->nullable();
            $table->string('email')->nullable();
            $table->string('office_phone', 15)->nullable();
            $table->string('whatsapp_no', 15)->nullable();
            $table->string('whatsapp', 15)->nullable();
            $table->text('address')->nullable();
            $table->string('type', 50)->nullable();
            $table->boolean('is_approved')->default(false);
            $table->unsignedBigInteger('division_id')->nullable();
            $table->string('designation', 100)->nullable();
            $table->text('remark')->nullable();
            $table->unsignedBigInteger('session_id')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->timestamps();

            // Foreign keys will be added by separate migration after tables are created
            // $table->foreign('division_id')->references('id')->on('divisions')->onDelete('set null');
            // $table->foreign('session_id')->references('id')->on('sessions')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('persons');
    }
};
