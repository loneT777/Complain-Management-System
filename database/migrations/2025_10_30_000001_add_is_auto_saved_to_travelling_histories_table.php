<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddIsAutoSavedToTravellingHistoriesTable extends Migration
{
    public function up(): void
    {
        Schema::table('travelling_histories', function (Blueprint $table) {
            $table->boolean('is_auto_saved')->default(false)->after('country');
        });
    }

    public function down(): void
    {
        Schema::table('travelling_histories', function (Blueprint $table) {
            $table->dropColumn('is_auto_saved');
        });
    }
}
