<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nfe_imei_units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('nfe_id')->constrained('nves')->cascadeOnDelete();
            $table->foreignId('imei_unit_id')->constrained('imei_units')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nfe_imei_units');
    }
};
