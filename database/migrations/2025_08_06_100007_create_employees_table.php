<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEmployeesTable extends Migration
{
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('nic_no', 12);
            $table->string('passport_no', 20)->nullable();
            $table->string('birthday', 10)->nullable();
            $table->string('phone_no', 12)->nullable();
            $table->string('whatsapp_no', 12)->nullable();
            $table->string('email', 150)->nullable();
            $table->unsignedBigInteger('organization_id');
            $table->unsignedBigInteger('designation_id')->nullable();
            $table->unsignedBigInteger('service_id')->nullable();
            $table->unsignedBigInteger('session_id');
            $table->foreign('organization_id')->references('id')->on('organizations')->onDelete('restrict')->onUpdate('cascade');
            $table->foreign('designation_id')->references('id')->on('designations')->onDelete('set null')->onUpdate('cascade');
            $table->foreign('service_id')->references('id')->on('services')->onDelete('set null')->onUpdate('cascade');
            $table->foreign('session_id')->references('id')->on('login_sessions')->onDelete('restrict')->onUpdate('restrict');

            //$table->foreignId('organization_id')->constrained()->onDelete('restrict')->onUpdate('cascade');
            //$table->foreignId('designation_id')->constrained()->onDelete('set null')->onUpdate('cascade');
            //$table->foreignId('service_id')->constrained()->onDelete('set nulll')->onUpdate('cascade');
            //$table->foreignId('session_id')->constrained('login_sessions')->onDelete('restrict')->onUpdate('restrict');
            //$table->timestamps();
            //$table->dateTime('created_date');
            //$table->dateTime('updated_date')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
}
