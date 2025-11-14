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
        // Drop 'title' column only if it exists
        if (Schema::hasColumn('parliament_members', 'title')) {
            Schema::table('parliament_members', function (Blueprint $table) {
                $table->dropColumn('title');
            });
        }

        // Add 'title' column back in the new position (after 'code')
        Schema::table('parliament_members', function (Blueprint $table) {
            if (!Schema::hasColumn('parliament_members', 'title')) {
                $table->string('title')->nullable()->after('code');
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Drop 'title' from new position if it exists
        if (Schema::hasColumn('parliament_members', 'title')) {
            Schema::table('parliament_members', function (Blueprint $table) {
                $table->dropColumn('title');
            });
        }

        // Add it back in the old position (after 'name')
        Schema::table('parliament_members', function (Blueprint $table) {
            if (!Schema::hasColumn('parliament_members', 'title')) {
                $table->string('title')->nullable()->after('name');
            }
        });
    }
};
