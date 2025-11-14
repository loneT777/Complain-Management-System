<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateApplicationExpensesMetTable extends Migration
{
    public function up(): void
    {
        Schema::create('application_expenses_met', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('application_id');
            $table->unsignedBigInteger('expenses_type_id');

            $table->foreign('application_id')->references('id')->on('applications')->onDelete('restrict')->onUpdate('cascade');
            $table->foreign('expenses_type_id')->references('id')->on('expenses_types')->onDelete('restrict')->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('application_expenses_met');
    }
}
