<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admin_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('session_id');
            $table->foreign('session_id')->references('id')->on('login_sessions')->onUpdate('restrict')->onDelete('restrict');
            //$table->foreignId('session_id')->constrained('login_sessions')->onUpdate('restrict')->onDelete('restrict');
            $table->text('logs');
            $table->timestamps();

            //$table->dateTime('created_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_logs');
    }
};
