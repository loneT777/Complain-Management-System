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
        Schema::table('complaint_assignments', function (Blueprint $table) {
            // Add complaint_id column after id (nullable first to avoid issues)
            $table->unsignedBigInteger('complaint_id')->nullable()->after('id');
            
            // Add timestamps
            $table->timestamps();
        });
        
        // Update existing records to use first complaint ID or delete if no complaints exist
        $firstComplaint = DB::table('complaints')->first();
        if ($firstComplaint) {
            DB::table('complaint_assignments')->whereNull('complaint_id')->update(['complaint_id' => $firstComplaint->id]);
        } else {
            // No complaints exist, delete all assignments
            DB::table('complaint_assignments')->delete();
        }
        
        // Now add the foreign key
        Schema::table('complaint_assignments', function (Blueprint $table) {
            $table->foreign('complaint_id')
                ->references('id')
                ->on('complaints')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('complaint_assignments', function (Blueprint $table) {
            $table->dropForeign(['complaint_id']);
            $table->dropColumn(['complaint_id', 'created_at', 'updated_at']);
        });
    }
};
