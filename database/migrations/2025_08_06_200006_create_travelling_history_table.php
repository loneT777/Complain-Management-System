<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTravellingHistoryTable extends Migration
{
    public function up(): void
    {
        Schema::create('travelling_histories', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('application_id');
            $table->foreign('application_id')->references('id')->on('applications')->onDelete('restrict')->onUpdate('cascade');

            $table->integer('year');
            $table->text('purpose_of_travel');
            // $table->string('travel_period', 100);
            $table->date('travelling_start_date');
            $table->date('travelling_end_date');
            $table->string('country', 100);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('travelling_history');
    }
}
