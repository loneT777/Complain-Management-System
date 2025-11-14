<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateApplicationGoslFundsTable extends Migration
{
    public function up(): void
    {
        Schema::create('application_gosl_funds', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('application_id');
            $table->unsignedBigInteger('gosl_fund_type_id');

            $table->foreign('application_id')->references('id')->on('applications')->onDelete('restrict')->onUpdate('cascade');
            $table->foreign('gosl_fund_type_id')->references('id')->on('gosl_fund_types')->onDelete('restrict')->onUpdate('cascade');

            $table->decimal('amount', 10, 2);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('application_gosl_funds');
    }
}
