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
        // Create new attachment_groups table (parent)
        Schema::create('attachment_groups', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('complaint_id')->nullable();
            $table->unsignedBigInteger('complaint_log_id')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->text('description')->nullable();
            $table->timestamp('uploaded_at')->nullable();
            $table->timestamps();

            $table->foreign('complaint_id')->references('id')->on('complaints')->onDelete('cascade');
            $table->foreign('complaint_log_id')->references('id')->on('complaint_logs')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
        });

        // Create new attachment_files table (children)
        Schema::create('attachment_files', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('attachment_group_id');
            $table->string('file_name');
            $table->string('file_path');
            $table->string('extension')->nullable();
            $table->timestamps();

            $table->foreign('attachment_group_id')->references('id')->on('attachment_groups')->onDelete('cascade');
        });

        // Add column to old attachments table to track migration
        Schema::table('attachments', function (Blueprint $table) {
            $table->unsignedBigInteger('attachment_group_id')->nullable()->after('id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('attachments', function (Blueprint $table) {
            $table->dropColumn('attachment_group_id');
        });
        
        Schema::dropIfExists('attachment_files');
        Schema::dropIfExists('attachment_groups');
    }
};
