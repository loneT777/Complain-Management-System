<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateGoslFundTypesTable extends Migration
{
    public function up(): void
    {
        Schema::create('gosl_fund_types', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gosl_fund_types');
    }
}
