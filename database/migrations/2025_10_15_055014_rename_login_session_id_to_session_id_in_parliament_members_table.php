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
        Schema::table('parliament_members', function (Blueprint $table) {
            $table->renameColumn('login_session_id', 'session_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('parliament_members', function (Blueprint $table) {
            $table->renameColumn('session_id', 'login_session_id');
        });
    }
};
