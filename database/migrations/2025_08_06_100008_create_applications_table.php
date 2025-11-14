<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateApplicationsTable extends Migration
{
    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->id();

            // Foreign keys with explicit 2-line structure
            $table->unsignedBigInteger('session_id');
            $table->unsignedBigInteger('employee_id');
            $table->unsignedBigInteger('organization_id');

            $table->foreign('session_id')->references('id')->on('login_sessions')->onDelete('restrict')->onUpdate('cascade');
            $table->foreign('employee_id')->references('id')->on('employees')->onDelete('restrict')->onUpdate('cascade');

            $table->foreign('organization_id')->references('id')->on('organizations')->onDelete('restrict')->onUpdate('cascade');

            // Other columns
            $table->string('awarding_agency', 100)->nullable();
            $table->string('countries_visited', 150);
            $table->text('purpose_of_travel');
            $table->date('departure_date');
            $table->date('arrival_date');
            $table->boolean('previous_report_submitted')->nullable();
            // $table->string('application_type', 50);
            $table->enum('application_type', ['1', '2']); //1= 'Officers application', 2 = 'Politicians application'
            $table->string('loan_particulars')->nullable();  // Assuming boolean is fine here
            $table->date('commencement_date')->nullable();
            $table->date('completion_date')->nullable();
            $table->text('foreign_contact_data')->nullable();
            $table->string('coverup_duty', 200)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
}
