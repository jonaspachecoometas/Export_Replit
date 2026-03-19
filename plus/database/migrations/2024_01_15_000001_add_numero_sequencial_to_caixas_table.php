<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('caixas', function (Blueprint $table) {
            if (!Schema::hasColumn('caixas', 'numero_sequencial')) {
                $table->integer('numero_sequencial')->nullable()->after('local_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('caixas', function (Blueprint $table) {
            if (Schema::hasColumn('caixas', 'numero_sequencial')) {
                $table->dropColumn('numero_sequencial');
            }
        });
    }
};
