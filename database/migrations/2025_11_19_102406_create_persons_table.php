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
            $table->string('full_name', 200);
            $table->string('nic', 12)->unique();
            $table->string('code', 50)->nullable();
            $table->string('office_phone', 15)->nullable();
            $table->string('whatsapp', 15)->nullable();
            $table->text('address')->nullable();
            $table->string('type', 50)->nullable();
            $table->string('designation', 100)->nullable();
            $table->text('remark')->nullable();
            $table->timestamps();
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
