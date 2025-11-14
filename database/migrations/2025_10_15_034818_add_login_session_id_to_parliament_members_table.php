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
            $table->unsignedBigInteger('login_session_id')->nullable()->after('designation_id');
            $table->foreign('login_session_id')->references('id')->on('login_sessions')->onDelete('cascade');
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
            $table->dropForeign(['login_session_id']);
            $table->dropColumn('login_session_id');
        });
    }
};
