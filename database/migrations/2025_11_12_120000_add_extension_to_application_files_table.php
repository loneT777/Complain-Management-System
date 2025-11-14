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
        Schema::table('application_files', function (Blueprint $table) {
            // Add extension column after file_name
            $table->string('extension', 20)->nullable()->after('file_name');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('application_files', function (Blueprint $table) {
            if (Schema::hasColumn('application_files', 'extension')) {
                $table->dropColumn('extension');
            }
        });
    }
};
