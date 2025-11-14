<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateExpensesTypesTable extends Migration
{
    public function up(): void
    {
        Schema::create('expenses_types', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses_types');
    }
}
